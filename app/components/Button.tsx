import { FC, MouseEventHandler } from "react"

interface SubmitButtonProps {
  type: "submit"
  title: string,
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
  const { title, size = "md", loading } = props;

  if (props.type == "submit") {
    return (
      <button type="submit" className={`bg-linear-to-tl from-pink-400 to-purple-500 
        rounded-sm ${size == "md" ? "py-3 px-6" : "py-1.5 px-4"} text-white cursor-pointer outline-none w-fit`} disabled={loading}>{title}</button>
    )
  }

  return <button type="button" className={`bg-linear-to-tl from-pink-400 to-purple-500 rounded-sm ${size == "md" ? "py-3 px-6" : "py-1.5 px-4"} text-white cursor-pointer outline-none w-fit`} onClick={props.onClick} disabled={loading}>{title}
  </button>
}

export default Button;