from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/data")
async def data(symbol: str = ""):
    if symbol == "":
        return {}
    
    stock = yf.Ticker(symbol)
    historical_data = stock.history(period="max")
    
    return {
            "symbol": symbol,
            "data": (
                historical_data
                .reset_index()
                [["Date","Close"]]
                .assign(
                    Date = lambda df: df.Date.apply(lambda f: f.tz_convert(None))
                )
                .to_dict(orient="records")
            )
    }

@app.get("/")
async def root():
    return {"Hello":"D3.js"}
