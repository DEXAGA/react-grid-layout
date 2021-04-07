import _ from "lodash";
import React from "react";
import RGL, {WidthProvider} from "react-grid-layout-hooks";

const ReactGridLayout = WidthProvider(RGL);

const ScaledLayout = (props) => {

  const [state, setState] = React.useState({
    layout: _.map(new Array(props.items), function(item, i) {
      const y = _.result(props, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: 2,
        h: y,
        i: i.toString()
      };
    })
  })

  return (
          <div style={{
            height: `100%`
          }}>
            <div style={{transform: 'scale(0.5) translate(-50%, -50%)'}}>
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
          </div>
  );
}

ScaledLayout.defaultProps = {
  className: "layout",
  items: 20,
  rowHeight: 30,
  onLayoutChange: function() {
  },
  cols: 12,
  transformScale: 0.5
};

export default ScaledLayout
