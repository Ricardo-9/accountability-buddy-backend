/**
 * @swagger
 * tags:
 *  - name: Auth
 *    description: Authentication and Authorization
 */

/**
 * @swagger
 * /user/signup:
 *  post:
 *      summary: Register a new user
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - password
 *                          - confirmPassword
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: example@email.com
 *                              format: email
 *                          password:
 *                              type: string
 *                              example: password123
 *                              format: password
 *                          confirmPassword:
 *                              type: string
 *                              example: password123
 *                              format: password
 *      responses:
 *          201:
 *              description: User successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: string
 *                                          format: uuid
 *                                          example: 550e8400-e29b-41d4-a716-446655440000
 *                                      email:
 *                                          type: string
 *                                          example: example@email.com
 *          400:
 *              description: Invalid data
 *          422:
 *              description: Email already in use
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /user/signin:
 *  post:
 *      summary: Sign in with a registered user
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - password
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: example@email.com
 *                              format: email
 *                          password:
 *                              type: string
 *                              example: password123
 *                              format: password
 *      responses:
 *          200:
 *              description: User successfully logged in
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: string
 *                                          format: uuid
 *                                          example: 550e8400-e29b-41d4-a716-446655440000
 *                                      email:
 *                                          type: string
 *                                          example: example@email.com
 *                                      accessToken:
 *                                          type: string
 *                                          example: "eyJhbGciOiJIUzI1NiIsInR5..." 
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Invalid credentials
 *          500:
 *              description: Internal server error
 */