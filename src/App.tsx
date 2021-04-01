import React from "react";
import './App.css';
import ShowcaseLayout from "./stories/0-showcase";
import BasicLayout from "./stories/1-basic";
import DynamicMinMaxLayout from "./stories/10-dynamic-min-max-wh";
import NoCompactingLayout from "./stories/11-no-vertical-compact";
import NoCollisionLayout from "./stories/12-prevent-collision";
import ErrorCaseLayout from "./stories/13-error-case";
import ToolboxLayout from "./stories/14-toolbox";
import DragFromOutsideLayout from "./stories/15-drag-from-outside";
import BoundedLayout from "./stories/16-bounded";
import ResizableHandles from "./stories/17-resizable-handles";
import ScaledLayout from "./stories/18-scale";
import NoDraggingLayout from "./stories/2-no-dragging";
import MessyLayout from "./stories/3-messy";
import GridPropertyLayout from "./stories/4-grid-property";
import StaticElementsLayout from "./stories/5-static-elements";
import AddRemoveLayout from "./stories/6-dynamic-add-remove";
import LocalStorageLayout from "./stories/7-localstorage";
import ResponsiveLocalStorageLayout from "./stories/8-localstorage-responsive";
import MinMaxLayout from "./stories/9-min-max-wh";

function Divider() {
  return <hr style={{
    width: '100%',
    height: 5,
  }}/>;
}

function App() {
  return (
          <div className="App">
            <div className={"App-header"}>
              {"See storybook for examples by running the following in your terminal:"}
              <br/>
              <br/>
              <br/>
              {"yarn storybook"}
              <br/>
              <br/>
              {"OR"}
              <br/>
              <br/>
              {"npm run storybook"}
            </div>
            <div style={{
              display: `grid`,
              gap: 100
            }}>
              <ShowcaseLayout/>
              <BasicLayout/>
              <NoDraggingLayout/>
              <MessyLayout/>
              <GridPropertyLayout/>
              <StaticElementsLayout/>
              <DynamicMinMaxLayout/>
              <LocalStorageLayout/>
              <ResponsiveLocalStorageLayout/>
              <MinMaxLayout/>
              <AddRemoveLayout/>
              <NoCompactingLayout/>
              <NoCollisionLayout/>
              <ErrorCaseLayout/>
              <ToolboxLayout/>
              <DragFromOutsideLayout/>
              <BoundedLayout/>
              <ResizableHandles/>
              {/*<BootstrapStyleLayout/>*/}
              <ScaledLayout/>
            </div>
          </div>
  );
}

export default App;
