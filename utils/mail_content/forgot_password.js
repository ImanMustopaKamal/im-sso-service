const env = require('../environment');
const jwt = require('jsonwebtoken');

module.exports = {
  MailBody: (recipient) => {
    try {
      let build_content = BuildContent(recipient)

      return build_content

    } catch (ex) {
      return ""
    }
  },
};

function BuildContent(recipient) {
  return `<mj-column>
  ${Greetings(recipient)}
  ${Intro()}
  ${Content(recipient)}
  ${Outro()}
  ${Sign()}
  </mj-column>`;
}

function Greetings(recipient) {
  return `<mj-text font-size="20px" font-weight="bold">Reset Riskobs Account Password</mj-text>
  <mj-spacer></mj-spacer>
  <mj-text font-size="16px">Dear ${recipient.name},</mj-text>
  <mj-spacer></mj-spacer>`;
}
function Intro() {
  return `<mj-text font-size="16px">You have requested to change your password. Please click the button below to reset your password:</mj-text>`;
}
function Content(recipient) {
  const token = jwt.sign(recipient, env.token.KEY, { expiresIn: '60m' })
  
  return `<mj-spacer></mj-spacer>
  <mj-button href="${env.app.url}/reset/${token}" inner-padding="20px 25px" font-size="16px" background-color="#6777ef" color="white">Reset Password</mj-button>
  <mj-spacer></mj-spacer>`
}
function Outro() {
  return `<mj-spacer></mj-spacer>
  <mj-text font-size="16px"><strong>Heads up:</strong> This link will expire in 60 minutes. Once it expires, you will have to request a new <a href="${env.app.url}/forgot" style="text-decoration:none;">reset password</a></mj-text>
  <mj-spacer></mj-spacer>`;
}
function Sign() {
  return `<mj-spacer></mj-spacer>
  <mj-text font-size="16px">Happy collaborating,</mj-text>
  <mj-text font-size="16px">Team Riskobs</mj-text>`;
}