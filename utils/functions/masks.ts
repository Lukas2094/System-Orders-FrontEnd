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

function formatDateBR(isoDate?: string){
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export { maskPhone, validateEmail, formatDateBR };