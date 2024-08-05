import axios from "axios";

const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL_PROD
  : process.env.REACT_APP_API_URL_LOCAL;

axios.defaults.baseURL = baseURL;

export default axios;
