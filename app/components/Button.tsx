import { FC, MouseEventHandler, RefObject } from "react"

interface SubmitButtonProps {
  type: "submit"
  title: string,
  onclick?: never,
  size?: string,
  loading?: boolean
}

interface ActionButtonProps {
  type?: "button"
  title: string,
  onClick: MouseEventHandler<HTMLButtonElement>
  size?: string,
  loading?: boolean
}

type Props = SubmitButtonProps | ActionButtonProps

const Button: FC<Props> = (props) => {
  const { type = "button", title, size = "md", loading } = props;

  if (type != "submit") {
    const { onClick } = props;

    return <button type={type} className={`bg-linear-to-tl from-pink-400 to-purple-500 rounded-sm ${size == "md" ? "py-3 px-6" : "py-1.5 px-4"} text-white cursor-pointer outline-none w-fit`} onClick={onClick} disabled={loading}>{title}
    </button>
  }

  return (
    <button type={type} className={`bg-linear-to-tl from-pink-400 to-purple-500 rounded-sm ${size == "md" ? "py-3 px-6" : "py-1.5 px-4"} text-white cursor-pointer outline-none w-fit`}>{title}</button>
  )
}

export default Button;