import checkAuthentication from "../helpers/checkAuthentication.js";

const allowOnlyAuthenticatedUser = async (req, res, next) => {
  await checkAuthentication(req);
  next();
};

export default allowOnlyAuthenticatedUser;
