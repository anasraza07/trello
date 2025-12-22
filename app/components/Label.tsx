import React from 'react'

interface Props {
  text: string
  labelFor: string
}

const Label = ({ text, labelFor = "" }: Props) => {
  return (
    <label htmlFor={labelFor} className="block text-[#44546F] text-sm font-semibold mb-1">{text}</label>
  )
}

export default Label