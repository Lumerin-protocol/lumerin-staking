import { Chevron } from "../icons/Chevron.tsx";

export const SpoilerToogle = () => {
  return (
    <>
      <label className="toogle">
        <input type="checkbox" className="toogle-checkbox" />
        <Chevron fill="#fff" className="toogle-arrow" />
      </label>
    </>
  );
};
