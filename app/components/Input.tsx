import React, { ChangeEventHandler, FC, InputHTMLAttributes, RefObject } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  type: string,
  value: string,
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder: string,
  ref?: RefObject<HTMLInputElement | null>
  extraClass?: string,
  autoComplete?: string
}

const Input: FC<Props> = ({ type, value, onChange, placeholder,
  extraClass = "", autoComplete, ...rest }) => {
  return (
    <input className={`border-none outline-none ring-1 ring-gray-500 focus:ring-2 focus:ring-blue-500 pl-2 py-1 rounded-sm placeholder:text-sm placeholder-gray-500 ${extraClass}`} type={type} placeholder={placeholder} autoComplete={autoComplete} value={value} onChange={onChange} {...rest} />
  )
}

export default Input