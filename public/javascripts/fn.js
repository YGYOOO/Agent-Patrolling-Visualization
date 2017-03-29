import 'whatwg-fetch';

class f {
  ajax({
    method = 'get',
    url,
    data,
    contentType = 'application/json; charset=UTF-8',
    headers = {},
    success,
    error
  }) {
    let req = new XMLHttpRequest();
    req.open(method, url, true);

    if (contentType) {
      req.setRequestHeader('Content-Type', contentType);
    }
    for (let key in headers) {
      req.setRequestHeader(key, headers[key]);
    }

    if (typeof success === 'function' && typeof error === 'function') {
        req.onreadystatechange = () => {
          if (req.readyState == 4) {
            if (req.status == 200) {
              success(req.response);
            } else {
              error(req.statusText);
            }
          }
        };
        req.send(data);
    } else {
      return new Promise((resolve, reject) => {
        req.onreadystatechange = () => {
          if (req.readyState == 4) {
            if (req.status == 200) {
              resolve(req.response);
            } else {
              reject(req.statusText);
            }
          }
        };
        req.send(data);
      });
    }
  }

  isPositiveInterger(num) {
    num = parseInt(num);
    return !isNaN(num) && num > 0;
  }

  debounce(f, delay, context) {
    let timer = null;
    let foo = function() {
      let args = arguments;
      if (args[0].target) args[0].persist();

      clearTimeout(timer);
      timer = setTimeout(() => {
        f.apply(context, args);
      }, delay);
    };
    return foo.bind(this);
  }
}

const $f = new f();

export {$f};