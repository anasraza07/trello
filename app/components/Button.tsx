import { FC, MouseEventHandler } from "react"

interface SubmitButtonProps {
  type: "submit"
  title: string,
  onclick?: never,
  size?: string,
}

interface ActionButtonProps {
  type?: "button"
  title: string,
  onClick: MouseEventHandler<HTMLButtonElement>
  size?: string,
}

type Props = SubmitButtonProps | ActionButtonProps

const Button: FC<Props> = (props) => {
  const { type = "button", title, size = "md" } = props;

  if (type != "submit") {
    const { onClick } = props;
    
    return <button type={type} className={`bg-linear-to-tl from-pink-400 to-purple-500 rounded-sm ${size == "md" ? "py-3 px-6" : "py-1.5 px-4" } text-white cursor-pointer outline-none w-fit`} onClick={onClick}>{title}
    </button>
  }

  return (
    <button type={type} className="bg-linear-to-tl from-pink-400 to-purple-500 rounded-sm py-3 px-6 text-white cursor-pointer outline-none w-fit">{title}</button>
  )
}

export default Button;