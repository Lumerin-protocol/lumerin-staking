interface Props extends React.SVGProps<SVGSVGElement> {
  angle?: number;
  fill?: string;
}

export const Arrow2: React.FC<Props> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none" {...props}>
    <title>Arrow</title>
    <path
      fill="#080810"
      d="M9 0 7.414 1.586l6.277 6.289H0v2.25h13.691l-6.277 6.289L9 18l9-9-9-9Z"
    />
  </svg>
);
