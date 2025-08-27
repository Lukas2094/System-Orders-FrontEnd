function maskPhone(value: string) {
  let v = value.replace(/\D/g, ""); 
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d{5})(\d{1,4})$/, "$1-$2"); 
  return v;
}

function validateEmail(value: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
}

export { maskPhone, validateEmail };