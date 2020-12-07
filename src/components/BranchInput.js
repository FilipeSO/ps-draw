import React, { useState } from "react";
import { getLinePoints } from "../utils";

const BranchInput = ({ updateEquips, equips, bars }) => {
  const defaultEquip = {
    endPointA: "",
    endPointB: "",
    r_pu: "",
    x_pu: "",
    bsh_pu: "",
    tap: "",
    tap_df_deg: "",
    tap_min: "",
    tap_max: "",
  };
  const [equip, setEquip] = useState(defaultEquip);
  const handleEquipChange = (e) => {
    let newState = { ...equip, [e.target.name]: e.target.value };
    setEquip(newState);
    // console.log(newState);
  };

  const handleEquipSubmit = (e) => {
    e.preventDefault();
    let equipType = equip.tap === 1 && equip.tap_df_deg === 0 ? "LT" : "TR";
    // let newEquip = equip;
    for (var key in equip) {
      if (key === "endPointA" || key === "endPointB") continue;
      equip[key] = parseFloat(equip[key].replace(",", "."));
    }

    let A = "";
    let B = "";
    if (parseInt(equip.endPointA) > parseInt(equip.endPointB)) {
      A = equip.endPointB; //endpointA é sempre o menor
      B = equip.endPointA;
    } else {
      A = equip.endPointA; //endpointA é sempre o menor
      B = equip.endPointB;
    }

    let equipName = "";
    let newState = [];
    if (equipType === "LT") {
      equipName = `LT_${A + B}`;
      let lineN =
        Object.values(equips).filter((equip) => equip.name === equipName)
          .length + 1;
      newState = {
        ...equips,
        [equipName + "_" + lineN]: {
          ...equip,
          type: equipType,
          name: equipName,
          n: lineN,
        },
      };
    } else {
      equipName = `TR_${A + B}`;
      let trN =
        Object.values(equips).filter(
          (equip) =>
            equip.name.substring(0, equip.name.lastIndexOf("_")) === equipName
        ).length + 1;
      let endPointA = bars[equip.endPointA];
      let endPointB = bars[equip.endPointB];
      let x1 = endPointA.pos.x;
      let y1 = endPointA.pos.y;
      let x2 = endPointB.pos.x;
      let y2 = endPointB.pos.y;
      let newX = (x1 + x2) / 2;
      let newY = (y1 + y2) / 2;
      if (trN > 1) {
        let newPos = getLinePoints(x1, y1, x2, y2, trN, 5, 100, 100);
        newX = (newPos[2] + newPos[4]) / 2;
        newY = (newPos[3] + newPos[5]) / 2;
      }
      newState = {
        ...equips,
        [equipName + "_" + trN]: {
          ...equip,
          endPointA: A,
          endPointB: B,
          name: equipName + "_" + trN,
          type: equipType,
          pos: {
            x: newX,
            y: newY,
          },
          n: trN,
        },
      };
    }
    console.log("NOVO EQUIP ADD", newState);
    updateEquips(newState);
    setEquip(defaultEquip);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mt-4 text-center text-gray-800">
        BRANCH MANUAL INPUT
      </h2>
      <form onSubmit={handleEquipSubmit}>
        <div className="md:flex md: items-center mt-2">
          <div className="flex items-center md:w-1/2">
            <label className="text-gray-700 text-sm font-bold mr-2">
              From:
            </label>
            <input
              className="flex-1 shadow border rounded py-1 px-1 text-gray-700 focus:outline-none focus:shadow-outline"
              type="text"
              name="endPointA"
              onChange={handleEquipChange}
              value={equip.endPointA}
              required
            ></input>
          </div>
          <div className="flex items-center md:w-1/2 md:mt-0 mt-2">
            <label className="md:ml-2 text-gray-700 text-sm font-bold mr-2">
              To:
            </label>
            <input
              className="flex-1 shadow border rounded py-1 px-1 text-gray-700 focus:outline-none focus:shadow-outline"
              type="text"
              name="endPointB"
              onChange={handleEquipChange}
              value={equip.endPointB}
              required
            ></input>
          </div>
        </div>

        <div className="md:flex items-center mt-2">
          <div className="flex items-center md:w-1/3">
            <label className="text-gray-700 text-sm font-bold mr-2">
              r [pu]:
            </label>
            <input
              className="w-full shadow border rounded py-1 px-1 text-gray-700 focus:outline-none focus:shadow-outline"
              type="text"
              name="r_pu"
              onChange={handleEquipChange}
              value={equip.r_pu}
              required
            ></input>
          </div>
          <div className="flex items-center md:w-1/3 md:mt-0 mt-2">
            <label className="md:ml-2 text-gray-700 text-sm font-bold mr-2">
              x [pu]:
            </label>
            <input
              className="w-full shadow border rounded py-1 px-1 text-gray-700 focus:outline-none focus:shadow-outline"
              type="text"
              name="x_pu"
              onChange={handleEquipChange}
              value={equip.x_pu}
              required
            ></input>
          </div>

          <div className="flex items-center md:w-1/3 md:mt-0 mt-2">
            <label className="md:ml-2 text-gray-700 text-sm font-bold mr-2">
              bsh (total) [pu]:
            </label>
            <input
              className="w-full shadow border rounded py-1 px-1 text-gray-700 focus:outline-none focus:shadow-outline"
              type="text"
              name="bsh_pu"
              onChange={handleEquipChange}
              value={equip.bsh_pu}
              required
            ></input>
          </div>
        </div>

        <div className="md:flex md: items-center mt-2">
          <div className="flex items-center md:w-1/2">
            <label className="text-gray-700 text-sm font-bold mr-2">
              tap linear:
            </label>
            <input
              className="flex-1 shadow border rounded py-1 px-1 text-gray-700 focus:outline-none focus:shadow-outline"
              type="text"
              name="tap"
              onChange={handleEquipChange}
              value={equip.tap}
              required
            ></input>
          </div>
          <div className="flex items-center md:w-1/2 md:mt-0 mt-2">
            <label className="md:ml-2 text-gray-700 text-sm font-bold mr-2">
              tap &phi; [deg]:
            </label>
            <input
              className="flex-1 shadow border rounded py-1 px-1 text-gray-700 focus:outline-none focus:shadow-outline"
              type="text"
              name="tap_df_deg"
              onChange={handleEquipChange}
              value={equip.tap_df_deg}
              required
            ></input>
          </div>
        </div>

        <div className="md:flex md: items-center mt-2">
          <div className="flex items-center md:w-1/2">
            <label className="text-gray-700 text-sm font-bold mr-2">
              tap min:
            </label>
            <input
              className="flex-1 shadow border rounded py-1 px-1 text-gray-700 focus:outline-none focus:shadow-outline"
              type="text"
              name="tap_min"
              onChange={handleEquipChange}
              value={equip.tap_min}
            ></input>
          </div>
          <div className="flex items-center md:w-1/2 md:mt-0 mt-2">
            <label className="md:ml-2 text-gray-700 text-sm font-bold mr-2">
              tap max:
            </label>
            <input
              className="flex-1 shadow border rounded py-1 px-1 text-gray-700 focus:outline-none focus:shadow-outline"
              type="text"
              name="tap_max"
              onChange={handleEquipChange}
              value={equip.tap_max}
            ></input>
          </div>
        </div>
        <div className="flex">
          <input
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded-md mt-1 cursor-pointer"
            type="submit"
            value="Add Branch"
          ></input>
        </div>
      </form>
    </div>
  );
};

export default BranchInput;