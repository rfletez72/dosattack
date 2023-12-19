const { Router } = require('express');
const { check, validationResult } = require('express-validator');
const { AttackAPI1 } = require('../middlewares/AttackAPI1');

module.exports = (gg) => {
  const mRouters = Router();

  /**
   * @swagger
   * /api/signup:
   *   post:
   *     description: login with an existing kukipos account
   *     parameters:
   *       - name: email
   *         description: email for login.
   *         in: query
   *         required: true
   *         type: string
   *       - name: password
   *         description: password assigned in your server.
   *         in: query
   *         required: true
   *         type: string
   * 
   *     responses:
   *       200:
   *         description: The request succeeded.
   *       400:
   *         description: The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
   *       401:
   *         description: Token invalid or expired.
   */

  mRouters.route('/').post([
    check('email').not().isEmpty(),
    check('password').not().isEmpty()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json(gg.returnDat(true, 400, 'API required values.', errors.array()));

    let mDat = {};
    if (Object.keys(req.query).length > 0)
      mDat = req.query;
    else
      mDat = req.body;
    const { email, password } = mDat;

    if (AttackAPI1(req.getIP) == true) {
      console.log('You have exceeded the number of calls allowed. Try again later.');
      res.status(400).json({ error: true, code: 400, message: 'You have exceeded the number of calls allowed. Try again later.', data: null });
    } else {
      console.log(email, password, req.getIP);
      return res.status(200).json(gg.returnDat(false, 200, "Good", "ABC1234"));
    }
    
  });

  return mRouters;
};
