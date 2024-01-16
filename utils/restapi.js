module.exports = {
  ok: (values, res, message = "Data was returned successfully") => {
    let status_code = 200;
    let data = {
      ...values,
      message: message
    };

    return res.status(status_code).json(data);
  },
  bad: (res, message = "Missing or invalid parameter(s)") => {
    let status_code = 400;
    let data = {
      error_code: 15,
      message: message,
    };
    return res.status(status_code).send(data);
  },
  notFound: (res, message = "Resource does not exist") => {
    let status_code = 404;
    let data = {
      error_code: 10,
      message: message,
    };

    return res.status(status_code).send(data);
  },
  unauthorized: (res, message = "Authorization token is missing or invalid") => {
    let status_code = 401;
    let data = {
      error_code: 11,
      message: message,
    };
    return res.status(status_code).send(data);
  },
  forbidden: (
    res,
    message = "Authenticated user doesn't have access to the resource"
  ) => {
    let status_code = 403;
    let data = {
      error_code: 12,
      message: message,
    };
    return res.status(status_code).send(data);
  },
  error: (res, message = "Internal server error") => {
    let status_code = 500;
    let data = {
      error_code: 13,
      message: message,
    };
    return res.status(status_code).send(data);
  },
  duplicated: (res, message = "Duplicated data") => {
    let status_code = 409;
    let data = {
      error_code: 16,
      message: message,
    };
    return res.status(status_code).send(data);
  },
};
