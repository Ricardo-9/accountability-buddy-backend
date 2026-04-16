/**
 * @swagger
 * tags:
 *  - name: Financial Categories
 *    description: Create, view, update and delete financial categories
 */

/**
 * @swagger
 * /finance/categories:
 *  get:
 *      summary: Get financial categories (paginated)
 *      description: Returns financial categories ordered with default categories first, then by name ascending
 *      tags: [Financial Categories]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: query
 *            name: limit
 *            required: false
 *            schema:
 *                type: integer
 *                minimum: 1
 *                maximum: 100
 *                default: 10
 *            description: Number of categories to return
 *          - in: query
 *            name: cursor
 *            required: false
 *            schema:
 *                type: string
 *                format: uuid
 *            description: Cursor for pagination
 *      responses:
 *          200:
 *              description: Categories successfully retrieved
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
 *                                      categories:
 *                                          type: array
 *                                          items:
 *                                              type: object
 *                                              properties:
 *                                                  id:
 *                                                      type: string
 *                                                      format: uuid
 *                                                  name:
 *                                                      type: string
 *                                                      example: "Alimentação"
 *                                                  isDefault:
 *                                                      type: boolean
 *                                                      example: false
 *                                                  updatedAt:
 *                                                      type: string
 *                                                      format: date-time
 *                                                      nullable: true
 *                                      nextCursor:
 *                                          type: string
 *                                          format: uuid
 *                                          nullable: true
 *                                          example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */


/**
 * @swagger
 * /finance/categories/{id}:
 *  get:
 *      summary: Get one financial category
 *      tags: [Financial Categories]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *                type: string
 *                format: uuid
 *            description: Category id
 *      responses:
 *          200:
 *              description: Category successfully retrieved
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
 *                                      name:
 *                                          type: string
 *                                          example: "Alimentação"
 *                                      isDefault:
 *                                          type: boolean
 *                                          example: false
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          nullable: true
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          404:
 *              description: Category not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */


/**
 * @swagger
 * /finance/categories:
 *  post:
 *      summary: Create a new financial category
 *      tags: [Financial Categories]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - name
 *                      properties:
 *                          name:
 *                              type: string
 *                              minLength: 2
 *                              maxLength: 120
 *                              example: "Transporte"
 *      responses:
 *          200:
 *              description: Category successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  example: Category created
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: string
 *                                          format: uuid
 *                                      name:
 *                                          type: string
 *                                      isDefault:
 *                                          type: boolean
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          nullable: true
 *          400:
 *              description: Invalid request data
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          409:
 *              description: Category already exists
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */


/**
 * @swagger
 * /finance/categories/{id}:
 *  patch:
 *      summary: Update a financial category
 *      tags: [Financial Categories]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *                type: string
 *                format: uuid
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - name
 *                      properties:
 *                          name:
 *                              type: string
 *                              minLength: 2
 *                              maxLength: 120
 *                              example: "Lazer"
 *      responses:
 *          200:
 *              description: Category successfully updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                              message:
 *                                  type: string
 *                                  example: Category updated
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: string
 *                                          format: uuid
 *                                      name:
 *                                          type: string
 *                                      isDefault:
 *                                          type: boolean
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          nullable: true
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: Default categories can not be modified
 *          404:
 *              description: Category not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */


/**
 * @swagger
 * /finance/categories/{id}:
 *  delete:
 *      summary: Delete a financial category
 *      tags: [Financial Categories]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *                type: string
 *                format: uuid
 *      responses:
 *          200:
 *              description: Category successfully deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  example: Category deleted
 *                              data:
 *                                  nullable: true
 *                                  example: null
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: Default categories can not be deleted
 *          404:
 *              description: Category not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */