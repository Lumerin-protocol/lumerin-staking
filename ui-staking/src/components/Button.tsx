import type { ButtonHTMLAttributes } from "react";

export const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { className, ...rest } = props;
  return (
    <button type="button" className={["button", className].join(" ")} {...rest}>
      {props.children}
    </button>
  );
};
