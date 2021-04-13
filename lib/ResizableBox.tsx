import * as React from 'react';

import Resizable from './Resizable';
import {ResizableBoxState, ResizeCallbackData} from "./propTypes";

// ElementConfig gives us an object type where all items present in `defaultProps` are made optional.
// <ResizableBox> does not have defaultProps, so we can use this type to tell Flow that we don't
// care about that and will handle it in <Resizable> instead.
// A <ResizableBox> can also have a `style` property.
type ResizableBoxProps = React.ComponentProps<typeof Resizable> & {
  style?: Object, children?: React.ReactChildren
};

const ResizableBox = (props: ResizableBoxProps) => {

  const [state, setState] = React.useState<ResizableBoxState>({
    width: props.width,
    height: props.height,
    propsWidth: props.width,
    propsHeight: props.height,
  })

  React.useEffect(() => {
    setState(prevState => {
      if (state.propsWidth !== props.width || state.propsHeight !== props.height) {
        return {
          ...prevState,
          width: props.width,
          height: props.height,
          propsWidth: props.width,
          propsHeight: props.height,
        };
      }
      return prevState
    })
  })

  const onResize = (e: React.SyntheticEvent<any>, data: ResizeCallbackData) => {
    const {size} = data;
    if (props.onResize) {
      e.persist && e.persist();
      setState(prevState => ({
        ...prevState,
        ...size
      }));
      props.onResize && props.onResize(e, data)
    } else {
      setState(prevState => {
        return {
          ...prevState,
          ...size
        }
      });
    }
  };

  // Basic wrapper around a Resizable instance.
  // If you use Resizable directly, you are responsible for updating the child component
  // with a new width and height.
  return (
          <Resizable
                  axis={props.axis}
                  draggableOpts={props.draggableOpts}
                  handle={props.handle}
                  handleSize={props.handleSize}
                  height={state.height}
                  lockAspectRatio={props.lockAspectRatio}
                  maxConstraints={props.maxConstraints}
                  minConstraints={props.minConstraints}
                  onResizeStart={props.onResizeStart}
                  onResize={onResize}
                  onResizeStop={props.onResizeStop}
                  resizeHandles={props.resizeHandles}
                  transformScale={props.transformScale}
                  width={state.width}
          >
            <div
                    {...props}
                    style={{
                      ...props?.style,
                      width: state.width + 'px',
                      height: state.height + 'px'
                    }}
            />
          </Resizable>
  );
}

export default ResizableBox
