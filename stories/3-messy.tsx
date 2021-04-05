// @flow
import _ from "lodash";
import * as React from "react";
import RGL, {WidthProvider} from "react-grid-layout-hooks";

const ReactGridLayout = WidthProvider(RGL);

const MessyLayout = (props) => {

  const [state, setState] = React.useState({
    layout: undefined
  })

  React.useEffect(() => {
    setState({
      layout: _.map(new Array(props.items), function(item, i) {
        const w = Math.ceil(Math.random() * 4);
        const y = Math.ceil(Math.random() * 4) + 1;
        return {
          x: (i * 2) % 12,
          y: Math.floor(i / 6) * y,
          w: w,
          h: y,
          i: i.toString()
        };
      })
    })
  }, [])

  return (
          <div style={{
            height: `100%`
          }}>
            {state?.layout && (
                    <ReactGridLayout
                            layout={state.layout}
                            onLayoutChange={(layout) => {
                              props.onLayoutChange(layout);
                            }}
                            {...props}
                    >
                      {_.map(_.range(props.items), function(i) {
                        return (
                                <div key={i}>
                                  <span className="text">{i}</span>
                                </div>
                        );
                      })}
                    </ReactGridLayout>
            )}
          </div>
  );
}

MessyLayout.defaultProps = {
  className: "layout",
  cols: 12,
  items: 20,
  onLayoutChange: function() {
  },
  rowHeight: 30,
};

export default MessyLayout
