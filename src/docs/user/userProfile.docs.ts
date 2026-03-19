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
 *                                  required:
 *                                      - id
 *                                      - createdAt
 *                                      - status
 *                                  properties:
 *                                      id:
 *                                          type: string
 *                                          format: uuid
 *                                          example: bc2d0f53-5041-46e8-a14c-267875a49f0c
 *                                      fullName:
 *                                          type: string
 *                                          example: User Name
 *                                          nullable: true
 *                                      birthDate:
 *                                          type: string
 *                                          format: date
 *                                          example: "2004-05-11"
 *                                          nullable: true
 *                                      phone:
 *                                          type: string
 *                                          example: "+5588999998888"
 *                                          nullable: true
 *                                      createdAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: "2020-04-10T12:00:00Z"
 *                                      updatedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          example: "2026-08-11T12:00:00Z"
 *                                          nullable: true
 *                                      deletedAt:
 *                                          type: string
 *                                          format: date-time
 *                                          nullable: true
 *                                      status:
 *                                          type: string
 *                                          example: active
 *                                          enum: [active, deleted]
 *          401:
 *              description: Missing or invalid token
 *          404:
 *              description: Profile not found
 *          429:
 *              description: Too many requests
 *          500:
 *              description: Internal server error
 */
