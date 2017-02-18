import isString from 'lodash/isString';

import ContentWrapper from './ContentWrapper';

/**
 * wraps string and VueComponents in an async require compatible callback function
 *
 * @param {string|function} content
 * @returns {function}
 */
export var resolveContent = function resolveContent(content) {
  if (isString(content)) {
    return function (cb) {
      return cb(ContentWrapper(content));
    };
  } else if (typeof content === 'function') {
    if (content.name === 'VueComponent') {
      return function (cb) {
        return cb(content);
      };
    } else {
      return content;
    }
  }
};