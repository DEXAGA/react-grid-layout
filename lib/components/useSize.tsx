import * as React from "react";

const useSize = (elementRef) => {

  const [state, setState] = React.useState({
    width: 1280,
    height: 900,
  });

  const onWindowResize = () => {
    // if (!state.mounted) return;
    const node = elementRef.current;
    // fix: grid position error when node or parentNode display is none by window resize
    // #924 #1084
    if (node instanceof HTMLElement && node.offsetWidth && node.offsetHeight) {
      setState(prevState => ({
        ...prevState,
        width: node.offsetWidth,
        height: node.offsetHeight
      }));
    }
  };

  React.useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    onWindowResize();
    setState(prevState => ({
      ...prevState,
      mounted: true
    }))
    return () => {
      setState(prevState => ({
        ...prevState,
        mounted: false
      }))
      window.removeEventListener("resize", onWindowResize);
    }
  }, [])

  return {...state}
};

useSize.defaultProps = {
  measureBeforeMount: false
};

export default useSize
