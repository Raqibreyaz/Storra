import checkAuthentication from "../helpers/checkAuthentication.js";

const allowOnlyAuthenticatedUser = async (req, res, next) => {
  await checkAuthentication(req, res);
  next();
};

export default allowOnlyAuthenticatedUser;
