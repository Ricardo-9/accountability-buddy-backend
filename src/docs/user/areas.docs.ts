/**
 * @swagger
 * tags:
 *  - name: Areas
 *    description: View and Edit Accountability Areas
 */

/**
 * @swagger
 * /user/areas:
 *  get:
 *      summary: Get user areas
 *      tags: [Areas]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: Areas successfully retrieved
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
 *                                      type: string
 *                                  example: ["GYM", "FINANCES"]
 *          401:
 *              description: Missing or invalid token
 *          500:
 *              description: Internal server error
 */

/**
 * @swagger
 * /user/areas:
 *  put:
 *      summary: Update user areas
 *      tags: [Areas]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - areas
 *                      properties:
 *                          areas:
 *                              type: array
 *                              items:
 *                                  type: string
 *                              example: ["NUTRITION", "GYM", "PRODUCTIVITY"]
 *      responses:
 *          200:
 *              description: Areas successfully updated
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
 *                                      type: string
 *                                  example: ["NUTRITION", "GYM", "PRODUCTIVITY"]
 *          400:
 *              description: Invalid data
 *          401:
 *              description: Missing or invalid token
 *          500:
 *              description: Internal server error
 */