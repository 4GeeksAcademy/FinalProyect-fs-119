import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const Home = () => {
	return (
		<div className="d-flex flex-column min-vh-100 bg-light">
			

			<main className="flex-grow-1 d-flex justify-content-center align-items-center">
				<div
					className="shadow text-center"
					style={{
						backgroundColor: "#d9d9d9",
						border: "2px solid #007bff",
						borderRadius: "10px",
						padding: "2rem",
						width: "90%",
						maxWidth: "700px",
					}}
				>
					<div
						style={{
							width: "110px",
							height: "110px",
							backgroundColor: "#e59898",
							borderRadius: "50%",
							margin: "0 auto 1rem auto",
						}}
					></div>

					<p className="fs-5 text-white">texto blabla</p>
					<p className="text-white mt-5">ya miramos qué poner aquí</p>
				</div>
			</main>

			
		</div>
	);
};