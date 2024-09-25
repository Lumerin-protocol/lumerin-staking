export const MorpheusCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 417 421" {...props}>
    <ellipse cx={208.5} cy={210.5} fill="url(#a)" rx={208.5} ry={210.5} />

    <path
      fill="#fff"
      d="M403.447 135.686a210.378 210.378 0 0 1 8.331 27.79l-132.827 56.337v14.576l125.753-53.331-17.947 38.938-107.801 45.72v14.576l99.445-42.181-17.955 38.938L247.401 325v-64.393L208.5 310.742l-38.896-50.135v64.388L56.56 277.044l-17.956-38.938 99.445 42.181v-14.576l-107.8-45.721-17.95-38.937 125.75 53.336v-14.576L5.222 163.477a210.361 210.361 0 0 1 8.33-27.791l137.935 58.505a44.824 44.824 0 0 1 17.888 13.778l39.125 50.438 39.12-50.438a44.723 44.723 0 0 1 17.887-13.778l137.94-58.505Z"
    />

    <defs>
      <linearGradient
        id="a"
        x1={57.235}
        x2={386.39}
        y1={78.422}
        y2={310.716}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#39D895" />
        <stop offset={1} stopColor="#0F8956" />
      </linearGradient>
    </defs>
  </svg>
);
