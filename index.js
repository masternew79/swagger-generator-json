function typeOf(something) {
    if (Array.isArray(something)) return 'array'
    return typeof something
}

function convertSchemaToJSON(schema) {
    const typeSchema = typeOf(schema)
    if (typeSchema == 'object') {
        return convertObjectToJSON(schema)
    }
    if (typeSchema == 'array') {
        return convertArrayToJSON(schema)
    }
    if (typeSchema == 'string') {
        return { "type": schema }
    }
    throw new Error('Schema must be object or array object!')
}

function convertArrayToJSON(array) {
    const item = array[0]
    let items = null
    if (typeOf(item) == 'object') {
        items = convertObjectToJSON(item)
    } else {
        items = {
            "type": item
        }
    }
    return {
        "type": "array",
        "items": items
    }
}


function convertObjectToJSON(object) {
    const entries = Object.entries(object) // [[key, value], [key, value]]
    let properties = {}

    for (let pair of entries) {
        const [key, value] = pair
        const typeOfValue = typeOf(value)
        if (typeOfValue == 'object') {
            const newJson = convertObjectToJSON(value)
            const newObjJson = assignNewJSON(key, newJson)
            properties = Object.assign(properties, newObjJson)
            continue
        }
        if (typeOfValue == 'array') {
            const newJson = convertArrayToJSON(value)
            const newArrayJson = assignNewJSON(key, newJson)
            properties = Object.assign(properties, newArrayJson)
            continue
        }
        properties = assignPairToProperties(properties, pair)
    }
    return {
        "type": "object",
        "properties": properties
    }
}

function assignNewJSON(key, newJson) {
    return {
        [`${key}`]: Object.assign({}, newJson)
    }
}

function assignPairToProperties(properties, pair) {
    const [key, value] = pair
    const newProperty = {
        [`${key}`]: {
            "type": value
        }
    }
    properties = Object.assign(properties, newProperty)
    return properties
}

class DType {
    static get string() {
        return 'string'
    }

    static get number() {
        return 'number'
    }

    static get boolean() {
        return 'boolean'
    }

    static get header() {
        return 'header'
    }

    static get query() {
        return 'query'
    }

    static get body() {
        return 'body'
    }

    static get path() {
        return 'path'
    }

    static get formData() {
        return 'formData'
    }

    static get get() {
        return 'get'
    }

    static get post() {
        return 'post'
    }

    static get put() {
        return 'put'
    }

    static get patch() {
        return 'patch'
    }

    static get delete() {
        return 'delete'
    }
}

class Parameter {
    constructor(name = "", type = "") {
        this.name = name
        this.required = true
        this.type = convertSchemaToJSON(type)
        this.description = ""
        this.in = ""
        this.schema = null
    }

    string() {
        this.type = "string"
        return this
    }

    /**
    * @param {string} format null or byte, binary, date, date-time, password
    */
    formatByte() {
        this.format = 'byte'
        return this
    }

    formatBinary() {
        this.format = 'binary'
        return this
    }

    formatDate() {
        this.format = 'date'
        return this
    }

    formatPassword() {
        this.format = 'password'
        return this
    }

    formatDatetime() {
        this.format = 'date-time'
        return this
    }

    number() {
        this.type = "number"
        return this
    }

    boolean() {
        this.type = "boolean"
        return this
    }

    describe(desc) {
        this.description = desc
        return this
    }

    required(status = true) {
        this.required = status
        return this
    }

    /**
     * Must call at end of instance
     */
    toJSON() {
        if (!this.name) throw new Error('"name" is required to create an parameter!')
        let param = {
            "name": this.name,
            ...this.type,
            "description": this.description,
            "in": this.in,
            "required": this.required
        }
        if (this.format) {
            param = Object.assign(param, { "format": this.format })
        }
        if (this.schema) {
            param = Object.assign(param, { "schema": this.schema })
        }
        return param
    }
}

class Header extends Parameter {
    constructor({ name, type, description = "" }) {
        super(name, type)
        this.in = 'header'
        this.description = description
        return this.toJSON()
    }
}

class Query extends Parameter {
    constructor({ name, type, description = "" }) {
        super(name, type)
        this.in = 'query'
        this.description = description
        return this.toJSON()
    }
}

class Path extends Parameter {
    constructor({ name, type, description = "" }) {
        super(name, type)
        this.in = 'path'
        this.description = description
        return this.toJSON()
    }
}

class FormData extends Parameter {
    constructor({ name, type, description = "" }) {
        super(name, type)
        this.in = 'formData'
        this.description = description
        return this.toJSON()
    }
}

class Body extends Parameter {
    constructor({ schema, description = "" }) {
        super("body")
        this.in = "body"
        this.schema = convertSchemaToJSON(schema) || {}
        this.description = description
        return this.toJSON()
    }
}

class Response {
    constructor({ schema, code = 200, description = "Successful Operation" }) {
        this.code = code
        this.description = description
        this.schema = convertSchemaToJSON(schema)
        return {
            [`${this.code}`]: {
                "description": this.description,
                "schema": {
                    "type": "object",
                    "properties": {
                        "status": {
                            "type": "boolean",
                            "default": true,
                        },
                        "message": {
                            "type": "string",
                        },
                        "data": {
                            ...this.schema
                        }
                    }
                }
            }
        }
    }
}

const ParamsType = {
    'body': Body,
    'query': Query,
    'formData': FormData,
    'header': Header,
    'path': Path
}

function convertBodyFromArray(arrayBody) {
    const properties = []
    for (let property of arrayBody) {
        const { name, type, description } = property
        properties.push({
            [`${name}`]: {
                description,
                ...convertSchemaToJSON(type)
            }
        })
    }

    return {
        "in": "body",
        "name": "body",
        "require": true,
        "schema": {
            "type": "object",
            "properties": Object.assign({}, ...properties)
        }
    }
}

class Operation {
    constructor({
        method,
        tags,
        summary = "",
        parameters,
        responses
    }) {
        this.tag = tags
        this.action = method || 'get'
        this.sum = summary
        this.params = this.convertParams(parameters)
        this.responses = Object.assign({}, ...responses)

        return {
            [`${this.action}`]: {
                "tags": [this.tag],
                "summary": this.sum,
                "description": this.description,
                "id": this.Id,
                "parameters": this.params,
                "responses": {
                    ...this.responses,
                    "400": {
                        "description": "Invalid input"
                    },
                    "404": {
                        "description": "Page not found"
                    },
                    "403": {
                        "description": "Unauthenticated"
                    }
                }
            }
        }
    }

    convertParams(params) {
        const arrParams = []
        const arrayBody = []
        if (!params && typeOf(params) !== 'array') {
            throw new Error('Parameters is required and must be array!')
        }
        for (const param of params) {
            const { name = '', description = '', place = '', type = '' } = param
            if (place == '') throw new Error('Place is required to create parameter')
            if (place == DType.body) {
                arrayBody.push({ name, type, description })
            } else {
                if (!ParamsType[place]) {
                    throw new Error('place must be in one of body, header, path, query, formData')
                }
                const newParam = new ParamsType[place]({ name, type, description })
                arrParams.push(newParam)
            }
        }
        if (arrayBody.length) {
            const body = convertBodyFromArray(arrayBody)
            arrParams.push(body)
        }
        return arrParams
    }
}
class API {
    constructor({ path, operation }) {
        if (!path) throw new Error("path is required to create new API!")
        if (!operation) throw new Error("operation is required to create new API!")

        this.path = path
        this.operation = Object.assign({}, ...operation)
        return {
            [`${this.path}`]: Object.assign({}, this.operation)
        }
    }
}
class Document {
    constructor({ version = "1.0.0", description = "", title = "", paths }) {
        return {
            "swagger": "2.0",
            "info": {
                "description": description,
                "version": version,
                "title": title,
            },
            "schemes": ["http", "https"],
            "paths": Object.assign({}, ...paths)
        }
    }
}

module.exports = {
    DType,
    Header,
    Body,
    Path,
    FormData,
    Query,
    Response,
    Operation,
    API,
    Document
}
