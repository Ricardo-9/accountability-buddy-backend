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
 *      summary: Get all financial categories for the authenticated user
 *      tags: [Financial Categories]
 *      security:
 *          - bearerAuth: []
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
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      required:
 *                                          - id
 *                                          - userId
 *                                          - name
 *                                          - isDefault
 *                                      properties:
 *                                          id:
 *                                              type: string
 *                                              format: uuid
 *                                              example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                                          userId:
 *                                              type: string
 *                                              format: uuid
 *                                              example: "bc2d0f53-5041-46e8-a14c-267875a49f0c"
 *                                          name:
 *                                              type: string
 *                                              example: "Alimentação"
 *                                          isDefault:
 *                                              type: boolean
 *                                              example: false
 *                                          createdAt:
 *                                              type: string
 *                                              format: date-time
 *                                              example: "2026-01-10T12:00:00Z"
 *                                          updatedAt:
 *                                              type: string
 *                                              format: date-time
 *                                              nullable: true
 *                                              example: "2026-03-15T08:30:00Z"
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
 *                              example: "Transport"
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
 *                                  required:
 *                                      - id
 *                                      - userId
 *                                      - name
 *                                      - isDefault
 *                                  properties:
 *                                      id:
 *                                          type: string
 *                                          format: uuid
 *                                          example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                                      userId:
 *                                          type: string
 *                                          format: uuid
 *                                          example: "bc2d0f53-5041-46e8-a14c-267875a49f0c"
 *                                      name:
 *                                          type: string
 *                                          example: "Transporte"
 *                                      isDefault:
 *                                          type: boolean
 *                                          example: false
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: "2026-01-10T12:00:00Z"
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          nullable: true
 *                                          example: null
 *          400:
 *              description: Invalid data or missing required fields
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area
 *          409:
 *              description: Category with this name already exists for the user
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
 *            description: The ID of the category to update
 *            example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  example: Category updated
 *                              data:
 *                                  type: object
 *                                  required:
 *                                      - id
 *                                      - userId
 *                                      - name
 *                                      - isDefault
 *                                  properties:
 *                                      id:
 *                                          type: string
 *                                          format: uuid
 *                                          example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                                      userId:
 *                                          type: string
 *                                          format: uuid
 *                                          example: "bc2d0f53-5041-46e8-a14c-267875a49f0c"
 *                                      name:
 *                                          type: string
 *                                          example: "Lazer"
 *                                      isDefault:
 *                                          type: boolean
 *                                          example: false
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: "2026-01-10T12:00:00Z"
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          nullable: true
 *                                          example: "2026-03-20T14:00:00Z"
 *          400:
 *              description: Invalid data or missing required fields
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area, or category is a default and cannot be modified
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
 *            description: The ID of the category to delete
 *            example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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
 *                                  type: object
 *                                  nullable: true
 *                                  example: null
 *          401:
 *              description: Missing or invalid token
 *          403:
 *              description: User does not have access to the FINANCES area, or category is a default and cannot be deleted
 *          404:
 *              description: Category not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */
