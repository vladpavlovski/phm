import React from 'react'
import Button from '@mui/material/Button'
import config from 'config'
import Popover from '@mui/material/Popover'
import Img from 'react-cool-img'
import hmsLoader from 'img/hms-loader.gif'

type TGameQrPayment = {
  bankAccountNumber: string
  bankCode: string
  currency: string
  vs: string
  message: string
}

const imgQrStyle = { width: '16rem', height: '16rem' }

const GameQrPayment: React.FC<TGameQrPayment> = React.memo(props => {
  const { bankAccountNumber, bankCode, currency, vs, message } = props
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget)
    },
    []
  )

  const handleClose = React.useCallback(() => {
    setAnchorEl(null)
  }, [])

  return (
    <>
      <Button variant="contained" size="small" onClick={handleClick}>
        QR Platba
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
      >
        <Img
          placeholder={hmsLoader}
          src={`${
            config.qrGeneratorServer
          }/czech/image?size=440&accountNumber=${bankAccountNumber}&bankCode=${bankCode}&amount=3600&currency=${currency.toUpperCase()}&vs=${vs}&message=${encodeURIComponent(
            message.trim()
          )}`}
          style={imgQrStyle}
          alt={'QR payment'}
        />
      </Popover>
    </>
  )
})

export { GameQrPayment }
