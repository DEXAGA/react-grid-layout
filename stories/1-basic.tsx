import _ from "lodash";
import React from "react";
import RGL, {WidthProvider} from "react-grid-layout-hooks";

const ReactGridLayout = RGL;

const BasicLayout = (props) => {

  const [state, setState] = React.useState({
    layout: undefined,
    height: undefined
  })

  React.useEffect(() => {
    setState({...state,
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
  }, [])

  const paddingX = 10;
  const paddingY = 10;
  const marginX = 10;
  const marginY = 10;
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
                            containerPadding={[paddingX, paddingY]}
                            margin={[marginX, marginY]}
                            rowHeight={state.height / 12 - marginY / 12 - paddingY / 12}
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

BasicLayout.defaultProps = {
  className: "layout",
  items: 20,
  rowHeight: 30,
  onLayoutChange: function() {
  },
  cols: 12
};

export default BasicLayout
