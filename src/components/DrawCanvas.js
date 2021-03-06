import React, { useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import Transformer from "./drawing/Transformer";
import Bar from "./drawing/Bar";
import TransmissionLine from "./drawing/TransmissionLine";
import { getLinePoints, getAngle } from "./drawing/utils";

import CanvasConfig from "./drawing/CanvasConfig";
import CanvasLegend from "./drawing/CanvasLegend";

// function useWindowSize() {
//   const [size, setSize] = useState([0, 0]);
//   useLayoutEffect(() => {
//     function updateSize() {
//       setSize([window.innerWidth, window.innerHeight]);
//     }
//     window.addEventListener("resize", updateSize);
//     updateSize();
//     return () => window.removeEventListener("resize", updateSize);
//   }, []);
//   return size;
// }

const DrawCanvas = ({ bars, equips, updateBars, updateEquips, parentRef }) => {
  const stageHeight = parentRef.current.clientHeight;
  const stageWidth = parentRef.current.clientWidth;

  const stageRef = useRef(null);
  const scaleBy = 1.1;
  const handleWheelZoom = (e) => {
    e.evt.preventDefault();
    var oldScale = stageRef.current.scaleX();
    var pointer = stageRef.current.getPointerPosition();
    var mousePointTo = {
      x: (pointer.x - stageRef.current.x()) / oldScale,
      y: (pointer.y - stageRef.current.y()) / oldScale,
    };
    var newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stageRef.current.scale({ x: newScale, y: newScale });
    var newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stageRef.current.position(newPos);
    stageRef.current.batchDraw();
  };

  const layerRef = useRef(null);
  const handleDrag = (e) => {
    e.evt.preventDefault();
    //redesenha TRs
    layerRef.current.children
      .filter((node) => node.attrs.type === "TR")
      .forEach((TR) => {
        // console.log(TR);
        let newEndPointA = layerRef.current.children.filter(
          (node) => node.attrs.name === TR.attrs.endPointA
        )[0].attrs;
        let newEndPointB = layerRef.current.children.filter(
          (node) => node.attrs.name === TR.attrs.endPointB
        )[0].attrs;
        let n = TR.attrs.n;
        // console.log(newEndPointA, newEndPointB);
        let x1 = newEndPointA.x;
        let y1 = newEndPointA.y;
        let x2 = newEndPointB.x;
        let y2 = newEndPointB.y;
        let newX = (x1 + x2) / 2;
        let newY = (y1 + y2) / 2;
        // console.log(newX, newY, n);

        if (n > 1) {
          let newPos = getLinePoints(x1, y1, x2, y2, n, 5, 100, 100);
          newX = (newPos[2] + newPos[4]) / 2;
          newY = (newPos[3] + newPos[5]) / 2;
        }
        getAngle(x2 - x1, y2 - y1);
        TR.rotation(getAngle(x2 - x1, y2 - y1));
        TR.position({
          x: newX,
          y: newY,
        });
      });

    //redesenha todas as linhas
    layerRef.current
      .getChildren((node) => node.getClassName() === "Line")
      .forEach((line) => {
        // console.log("linha", line);
        let newEndPointA = layerRef.current.children.filter(
          (element) => element.attrs.name === line.attrs.endPointA
        )[0].attrs;
        let newEndPointB = layerRef.current.children.filter(
          (element) => element.attrs.name === line.attrs.endPointB
        )[0].attrs;
        // console.log(newEndPointA, newEndPointB);
        let n = line.attrs.n;
        let linePoints = [];
        //APENAS PARA DRAW A SEMPRE MENOR QUE B
        if (parseInt(newEndPointA.name) > parseInt(newEndPointB.name)) {
          linePoints = getLinePoints(
            newEndPointB.x,
            newEndPointB.y,
            newEndPointA.x,
            newEndPointA.y,
            n
          );
        } else {
          linePoints = getLinePoints(
            newEndPointA.x,
            newEndPointA.y,
            newEndPointB.x,
            newEndPointB.y,
            n
          );
        }
        line.attrs.points = linePoints;
      });
    layerRef.current.batchDraw();
  };
  const handleDragEnd = (e) => {
    e.evt.preventDefault();
    let barState = bars[e.target.attrs.name];
    let newState = {
      ...bars,
      [e.target.attrs.name]: {
        ...barState,
        pos: e.target.position(),
      },
    };
    updateBars(newState);
    newState = equips;
    layerRef.current.children
      .filter((node) => node.attrs.type === "TR")
      .forEach((TR) => {
        // console.log(TR.attrs.name, TR.position());
        let equipState = equips[TR.attrs.name];
        equipState.pos = TR.position();
        newState = {
          ...equips,
          [TR.attrs.name]: {
            ...equipState,
          },
        };
      });
    // console.log(newState);
    updateEquips(newState);
  };
  // const size = useWindowSize(); //[width,height]

  const [canvasConfig, setCanvasConfig] = useState({
    show_id: true,
    show_results: true,
    line_opacity: "100",
  });
  return (
    <div className="relative">
      <CanvasConfig
        canvasConfig={canvasConfig}
        setCanvasConfig={setCanvasConfig}
      ></CanvasConfig>
      <CanvasLegend></CanvasLegend>
      <Stage
        width={stageWidth}
        height={stageHeight}
        onWheel={handleWheelZoom}
        draggable={true}
        ref={stageRef}
      >
        <Layer ref={layerRef}>
          {Object.values(equips).map((equip, index) => {
            switch (equip.type) {
              case "LT":
                return (
                  <TransmissionLine
                    key={index}
                    endPointA={equip.endPointA}
                    endPointB={equip.endPointB}
                    n={equip.n}
                    color={equip.color}
                    bars={bars}
                    canvasConfig={canvasConfig}
                  />
                );
              case "TR":
                return (
                  <Transformer
                    key={index}
                    name={equip.name}
                    endPointA={equip.endPointA}
                    endPointB={equip.endPointB}
                    bars={bars}
                    x={equip.pos.x}
                    y={equip.pos.y}
                    n={equip.n}
                    handleDrag={handleDrag}
                    canvasConfig={canvasConfig}
                  />
                );
              default:
                return null;
            }
          })}

          {Object.keys(bars).map((key, index) => (
            <Bar
              bar={bars[key]}
              handleDrag={handleDrag}
              handleDragEnd={handleDragEnd}
              key={index}
              canvasConfig={canvasConfig}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawCanvas;
