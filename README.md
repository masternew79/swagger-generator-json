# SWAGGER GENERATOR JSON

Library generate json use for swagger-ui-express

## Quick start

### Example for 1 method in document:
```js
// example.js file

const { DType, Response, Operation, API } = require('swagger-generator-json')
// By default will be get method
const documentsSearchUser = new API({
    path: '/public/users/search',
    operation: [
        new Operation({
            method: DType.get,
            parameters: [
                {
                    name: 'username',
                    type: DType.string,
                    place: DType.query
                }
            ],
            responses: [
                new Response({
                    schema: [{
                        id: DType.number,
                        name: DType.string,
                        isAdmin: DType.boolean
                    }]
                }),
                new Response({
                    code: 302,
                    schema: [{
                        id: DType.number,
                        name: DType.string,
                        isAdmin: DType.boolean
                    }]
                })
            ],
            tags: 'public/user'
        })
    ]
})
```

### Example for multi method in document:
```js
// example.js file

const { DType, Response, Operation, API } = require('swagger-generator-json')
// GET method
const operationGet = new Operation({
    method: DType.get,
    parameters: [
        {
            name: 'token',
            type: DType.string,
            place: DType.body,
            description: "Token user"
        },
        {
            name: 'list',
            type: [DType.string],
            place: DType.body,
            description: "List book"
        },
        {
            name: 'userid',
            type: DType.string,
            place: DType.path,
            description: "Id user"
        }
    ],
    responses: [
        new Response({
            schema: [{
                id: DType.number,
                name: DType.string,
                isAdmin: DType.boolean
            }]
        })
    ],
    summary: "API GET USER",
    tags: 'public/user'
})

// POST method
const operationPost = new Operation({
    method: DType.post,
    parameters: [
        {
            name: 'token',
            type: DType.string,
            place: DType.body,
            description: "Token user"
        },
        {
            name: "list",
            type: [DType.string],
            place: DType.query
        }
    ],
    responses: [
        new Response({
            schema: {
                id: DType.number,
                name: DType.string,
                isAdmin: DType.boolean
            },
        })
    ],
    tags: 'public/user',
    summary: "API CREATE USER"
})

const documentsPublicUser = new API({
    path: '/public/users',
    operation: [operationGet, operationPost]
})
```

### Export to use
```js
module.exports = [documentsPublicUser, documentsSearchUser]
```

### Create instance Document
```js
// document.js file
const paths = require('./example')
const { Document } = require('swagger-generator-json')

module.exports = new Document({
    description: `This is the Devteam's documents of project`,
    version: "1.0.0",
    title: "App Name",
    paths
})
```

### Use with swagger-ui-express
```js
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./documents');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```
