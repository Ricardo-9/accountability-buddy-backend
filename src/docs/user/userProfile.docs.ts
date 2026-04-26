/**
 * @swagger
 * tags:
 *  - name: Profiles
 *    description: View, update and delete the profile
 */

/**
 * @swagger
 * /user/me:
 *  get:
 *      summary: Get user profile
 *      tags: [Profiles]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: User profile successfully retrieved
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
 *                                      profile:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                                  format: uuid
 *                                                  example: bc2d0f53-5041-46e8-a14c-267875a49f0c
 *                                              fullName:
 *                                                  type: string
 *                                                  example: Ricardo Rocha
 *                                                  nullable: true
 *                                              birthDate:
 *                                                  type: string
 *                                                  format: date
 *                                                  example: "2004-05-11"
 *                                                  nullable: true
 *                                              phone:
 *                                                  type: string
 *                                                  example: "+5588999998888"
 *                                                  nullable: true
 *                                              status:
 *                                                  type: string
 *                                                  enum: [ACTIVE, DELETED]
 *                                                  example: ACTIVE
 *          401:
 *              description: Missing or invalid token
 *          404:
 *              description: Profile not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */


/**
 * @swagger
 * /user/me:
 *  patch:
 *      summary: Update user profile
 *      tags: [Profiles]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      description: At least one field must be provided
 *                      properties:
 *                          fullName:
 *                              type: string
 *                              minLength: 2
 *                              maxLength: 120
 *                              example: "Ricardo Souza"
 *                              nullable: true
 *                          birthDate:
 *                              type: string
 *                              format: date
 *                              example: "2004-05-11"
 *                              nullable: true
 *                          phone:
 *                              type: string
 *                              example: "+5588999998888"
 *                              nullable: true
 *      responses:
 *          200:
 *              description: Profile successfully updated
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
 *                                  example: User profile sucessfully updated
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      profile:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                                  format: uuid
 *                                                  example: bc2d0f53-5041-46e8-a14c-267875a49f0c
 *                                              fullName:
 *                                                  type: string
 *                                                  example: "Ricardo Souza"
 *                                                  nullable: true
 *                                              birthDate:
 *                                                  type: string
 *                                                  format: date
 *                                                  example: "2004-05-11"
 *                                                  nullable: true
 *                                              phone:
 *                                                  type: string
 *                                                  example: "+5588999998888"
 *                                                  nullable: true
 *                                              status:
 *                                                  type: string
 *                                                  enum: [ACTIVE, DELETED]
 *                                                  example: ACTIVE
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          404:
 *              description: Profile not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */


/**
 * @swagger
 * /user/me:
 *  delete:
 *      summary: Delete user profile
 *      tags: [Profiles]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: Profile successfully deleted
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
 *                                  example: User profile sucessfully deleted
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      profile:
 *                                          type: object
 *                                          properties:
 *                                              id:
 *                                                  type: string
 *                                                  format: uuid
 *                                                  example: bc2d0f53-5041-46e8-a14c-267875a49f0c
 *                                              fullName:
 *                                                  type: string
 *                                                  example: Ricardo Rocha
 *                                                  nullable: true
 *                                              birthDate:
 *                                                  type: string
 *                                                  format: date
 *                                                  example: "2004-05-11"
 *                                                  nullable: true
 *                                              phone:
 *                                                  type: string
 *                                                  example: "+5588999998888"
 *                                                  nullable: true
 *                                              status:
 *                                                  type: string
 *                                                  enum: [ACTIVE, DELETED]
 *                                                  example: DELETED
 *          401:
 *              description: Missing or invalid token
 *          404:
 *              description: Profile not found
 *          502:
 *              description: Failed to deactivate account in authentication system
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */