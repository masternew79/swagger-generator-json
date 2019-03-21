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
                    place: DType.query,
                    description: "Username must be required"
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

![alt text](https://firebasestorage.googleapis.com/v0/b/mn-shop.appspot.com/o/example1.PNG?alt=media&token=aca378a2-480f-498f-9fe6-6bb3566cf94b "Visualize of bellow document instance")

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
            description: "Token need to authenticate"
        },
        {
            name: 'userid',
            type: DType.string,
            place: DType.path,
            description: "Only number"
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
            place: DType.header,
            description: "Token need to authenticate"
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

![alt text](https://firebasestorage.googleapis.com/v0/b/mn-shop.appspot.com/o/example2.PNG?alt=media&token=b5fca552-d3cd-4c43-97a6-5ebd5bc6eea7 "Visualize of bellow document instance")

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
