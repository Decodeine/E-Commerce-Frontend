export const updateObject = <T extends object, U extends Partial<T>>(oldObject: T, updatedProperties: U): T & U => {
  return {
    ...oldObject,
    ...updatedProperties
  };
};