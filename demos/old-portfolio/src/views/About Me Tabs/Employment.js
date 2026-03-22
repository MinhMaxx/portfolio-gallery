import React from "react";
import "./Employment.css";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { employment } from "../../data";

const Employment = () => {
  return (
    <section id="employment" className="employment">
      <VerticalTimeline>
        {employment.map((history) => (
          <VerticalTimelineElement
            key={history._id}
            iconStyle={{
              background: "linear-gradient(90deg, #ff544f, #fad027)",
            }}
            date={`${new Date(history.startDate).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })} -  
                  ${
                    history.endDate
                      ? new Date(history.endDate).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Present"
                  }`}
          >
            <h3 className="vertical-timeline-element-title">
              {history.position} at {history.company}
            </h3>
            <p className="vertical-timeline-element-subtitle">
              {history.description}
            </p>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </section>
  );
};

export default Employment;
