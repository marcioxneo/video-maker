function actualDate() {
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  const hour = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  const actualDate = `${day}/${month}/${year}`
  const actualTime = `${hour}:${minutes}:${seconds}`
  const dateTimeAtual = `${actualDate} -> ${actualTime}`

  return dateTimeAtual
}

module.exports = {
  actualDate,
}

