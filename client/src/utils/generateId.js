// Generate temporary IDs for questions and options before saving to database
export const generateTempId = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
