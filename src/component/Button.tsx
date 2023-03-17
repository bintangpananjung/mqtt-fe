import React from "react";
import Spinner from "./Spinner";

type Props = {
  on: number;
  action: any;
  placeholder: string;
};

const Button = (props: Props) => {
  return (
    <button
      type="button"
      className={
        "text-white rounded-lg text-sm px-5 py-2.5 disabled:bg-[#c78282] min-h-[50px] min-w-[120px] flex justify-center items-center " +
        (props.on === 1
          ? "bg-[#c0cb99] hover:bg-[#9ea87f]"
          : "bg-[#E97777] hover:bg-[#c96666]")
      }
      disabled={props.on === -1}
      onClick={() => {
        props.action();
      }}
    >
      {props.on === 0 ? (
        <p className="font-bold text-lg">{props.placeholder}: Off</p>
      ) : (
        ""
      )}
      {props.on === 1 ? (
        <p className="font-bold text-lg">{props.placeholder}: On</p>
      ) : (
        ""
      )}
      {props.on === -1 ? <Spinner /> : ""}

      {/* <Spinner /> */}
    </button>
  );
};

export default Button;
