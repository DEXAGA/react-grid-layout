import * as React from "react";
import PropTypes from "prop-types";
// @ts-ignore
import classNames from "classnames";


const layoutClassName = "react-grid-layout";

/*
 * A simple HOC that provides facility for listening to container resizes.
 *
 * The Flow type is pretty janky here. I can't just spread `WPProps` into this returned object - I wish I could - but it triggers
 * a flow bug of some sort that causes it to stop typechecking.
 */
export default function WidthProvideRGL<Config>(
  ComposedComponent: any
) {
  return class WidthProvider extends React.Component {
    static defaultProps  = {
      measureBeforeMount: false
    };

    static propTypes = {
      // If true, will not render children until mounted. Useful for getting the exact width before
      // rendering, to prevent any unsightly resizing.
      measureBeforeMount: PropTypes.bool
    };

    state  = {
      width: 1280
    };

    elementRef  = React.createRef();
    mounted: boolean = false;

    componentDidMount() {
      this.mounted = true;
      window.addEventListener("resize", this.onWindowResize);
      // Call to properly set the breakpoint and resize the elements.
      // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
      // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll` on your body.
      this.onWindowResize();
    }

    componentWillUnmount() {
      this.mounted = false;
      window.removeEventListener("resize", this.onWindowResize);
    }

    onWindowResize = () => {
      if (!this.mounted) return;
      const node = this.elementRef.current; // Flow casts this to Text | Element
      // fix: grid position error when node or parentNode display is none by window resize
      // #924 #1084
      if (node instanceof HTMLElement && node.offsetWidth) {
        this.setState({ width: node.offsetWidth });
      }
    };

    render() {
      const {
        measureBeforeMount,
        style, className,
        ...rest
      }:any = this.props ;
      if (measureBeforeMount && !this.mounted) {

        return (
          <div
            className={classNames(className, layoutClassName)}
            style={style}

        // @ts-ignore
            ref={this.elementRef}
          />
        );
      }

      return (
        <ComposedComponent
          innerRef={this.elementRef}
          {...rest}
          {...this.state}
        />
      );
    }
  };
}
