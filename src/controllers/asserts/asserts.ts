export function assertExists<T>(param: T) {
  // Check if parameter isn't undefined/null
  if (!(param != null) || (typeof param === 'string' && !param)) {
    return false;
  }
  return true;
}

export function assertNumber<T>(param: T) {
  // Check if parameter isn't a number or a non-empty string
  const hasValue =
    typeof param === 'number' ||
    (typeof param === 'string' && param.trim() !== '');

  // Check isNaN as well to check string number validity
  if (!hasValue || isNaN(param as number)) {
    return false;
  }
  return true;
}

export function assertString<T>(param: T) {
  // Check if parameter is a non-empty string
  const hasValue = typeof param === 'string' && param.trim() !== '';

  if (!hasValue) {
    return false;
  }

  return true;
}
