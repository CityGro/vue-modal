import ContentWrapper from './ContentWrapper'
import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import property from 'lodash/property'

/**
 * wraps string and VueComponents in an async require compatible callback function
 *
 * @param {string|function} content
 * @returns {function}
 */
export const resolveContent = (content) => {
  if (isString(content)) {
    return (cb) => cb(ContentWrapper(content))
  } else if (isFunction(content)) {
    if (content.name === 'VueComponent') {
      return (cb) => cb(content)
    } else {
      return content
    }
  }
}

export const getOptions = (Modal) => {
  let options = property('$modalOptions')(Modal)
  if (!options) {
    options = property('options.$modalOptions')(Modal)
  }
  if (!options) {
    options = {}
  }
  return options
}
