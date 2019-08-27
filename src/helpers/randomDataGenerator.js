const generateData = (size = 10, onlyNumbers = false) => {
  let generatedText = ''
  const alphanumeric = onlyNumbers ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < size; i += 1) {
    generatedText += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length))
  }

  return onlyNumbers ? Number(generatedText) : generatedText
}

module.exports = generateData
