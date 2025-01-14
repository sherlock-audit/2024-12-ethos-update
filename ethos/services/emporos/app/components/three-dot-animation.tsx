export function ThreeDotsAnimation() {
  return (
    <div className="flex justify-center items-center gap-1 w-auto">
      <span className="sr-only">Loading...</span>
      <div className="h-2 w-2 bg-antd-colorTextDescription rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 bg-antd-colorTextDescription rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 bg-antd-colorTextDescription rounded-full animate-bounce" />
    </div>
  );
}
