import React, { ChangeEventHandler, FC, InputHTMLAttributes, RefObject } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  type: string,
  value: string,
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder: string,
  ref?: RefObject<HTMLInputElement | null>
}

const Input: FC<Props> = ({ type, value, onChange, placeholder, ...rest }) => {
  return (
    <input className=" border-none outline-none ring-1 ring-gray-800 pl-3 py-2 rounded-sm placeholder:text-sm placeholder-gray-500" type={type} placeholder={placeholder} autoComplete={type} value={value} onChange={onChange} {...rest} />
  )
}

export default Input