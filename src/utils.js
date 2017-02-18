import isString from 'lodash/isString'

import ContentWrapper from './ContentWrapper'

/**
 * wraps string and VueComponents in an async require compatible callback function
 *
 * @param {string|function} content
 * @returns {function}
 */
export const resolveContent = (content) => {
  if (isString(content)) {
    return (cb) => cb(ContentWrapper(content))
  } else if (typeof content === 'function') {
    if (content.name === 'VueComponent') {
      return (cb) => cb(content)
    } else {
      return content
    }
  }
}
