import { useState, useEffect } from 'react';
import Card, { CardType, CardPosition } from '../Card/Card';
import styles from './Solitaire.module.css';

const Solitaire = (): JSX.Element => {
	const [stock, setStock] = useState<CardType[]>([]);
	const [stockIndex, setStockIndex] = useState<number>(-1);
	const [waste, setWaste] = useState<CardType[][]>([]);
	const [foundations, setFoundations] = useState<CardType[][]>([[], [], [], []]);
	const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
	const [numberOfMoves, setNumberOfMoves] = useState<number>(0);

	const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
	const SUITS = Array.from(Array(4).keys());
	const WASTE_PILES = 7;
	const FOUNDATION_PILES = 4;

	useEffect(() => {
		let isWasteEmpty = true;
		for (let i = 0; i < waste.length; i++) {
			if (waste[i].length > 0) {
				isWasteEmpty = false;
				break;
			}
		}
		if (isWasteEmpty && numberOfMoves > 0) {
			setIsGameFinished(true);
		}
	}, [waste]);

	const newGameClickHandler = (): void => {
		resetGame();
	};

	const resetGame = (): void => {
		const newDeck: CardType[] = [];
		VALUES.forEach((value) => {
			SUITS.forEach((suit) => {
				newDeck.push({ suit, value, visible: false });
			});
		});
		shuffleDeck(newDeck);

		const newWaste: CardType[][] = [];
		for (let i = 0; i < WASTE_PILES; i++) {
			newWaste.push([]);
			for (let j = 0; j <= i; j++) {
				const card = newDeck.pop();
				if (card) {
					if (j === i) {
						card.visible = true;
					} else {
						card.visible = false;
					}
					newWaste[i].push(card);
				}
			}
		}
		setWaste(newWaste);
		setStock(newDeck);
		setFoundations([[], [], [], []]);
		setStockIndex(-1);
		setIsGameFinished(false);
	};

	const shuffleDeck = (deck: CardType[]): void => {
		for (let i = deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = deck[i];
			deck[i] = deck[j];
			deck[j] = temp;
		}
	};

	const hiddenStockClickHandler = (): void => {
		if (stockIndex < stock.length - 1) {
			setStockIndex(stockIndex + 1);
		} else {
			setStockIndex(-1);
		}
		setNumberOfMoves(numberOfMoves + 1);
	};

	const visibleStockClickHandler = (): void => {
		const foundationPileToMoveCard = getFoundationPileToMoveCard(foundations, stock[stockIndex]);
		if (foundationPileToMoveCard !== -1) {
			moveFromStockToFoundation(stock[stockIndex], foundationPileToMoveCard);
		} else {
			const wastePileToMoveCard = getWastePileToMoveCard(waste, stock[stockIndex]);
			if (wastePileToMoveCard !== -1) {
				moveFromStockToWaste(stock[stockIndex], wastePileToMoveCard);
			}
		}
	};

	const foundationClickHandler = (pileIndex: number): void => {
		const topCard = foundations[pileIndex][foundations[pileIndex].length - 1];
		const wastePileToMoveCard = getWastePileToMoveCard(waste, topCard);
		if (wastePileToMoveCard !== -1) {
			moveFromFoundationToWaste(topCard, pileIndex);
		}
	};

	const wasteClickHandler = (pileIndex: number, cardIndex: number): void => {
		let isTopCard = false;
		if (cardIndex === waste[pileIndex].length - 1) {
			isTopCard = true;
		}
		const selectedCard = waste[pileIndex][cardIndex];
		const foundationPileToMoveCard = getFoundationPileToMoveCard(foundations, selectedCard);
		if (isTopCard && foundationPileToMoveCard !== -1) {
			moveFromWasteToFoundation(selectedCard, pileIndex, foundationPileToMoveCard);
		} else {
			const wastePileToMoveCard = getWastePileToMoveCard(waste, selectedCard);
			if (wastePileToMoveCard !== -1) {
				let cardsToMove;
				if (isTopCard) {
					cardsToMove = [selectedCard];
				} else {
					cardsToMove = waste[pileIndex].slice(cardIndex);
				}
				moveFromWasteToWaste(cardsToMove, pileIndex, wastePileToMoveCard);
			}
		}
	};

	const getFoundationPileToMoveCard = (foundations: CardType[][], card: CardType): number => {
		let targetPile = -1;
		let index = 0;
		for (let pile of foundations) {
			if (pile.length === 0 && card.value === 1) {
				targetPile = index;
				break;
			} else if (pile.length > 0) {
				const topCard = pile[pile.length - 1];
				if (topCard.suit === card.suit && topCard.value + 1 === card.value) {
					targetPile = index;
					break;
				}
			}
			index++;
		}

		return targetPile;
	};

	const getWastePileToMoveCard = (waste: CardType[][], card: CardType): number => {
		let targetPile = -1;
		let index = 0;
		for (let pile of waste) {
			if (pile.length === 0 && card.value === 13) {
				targetPile = index;
				break;
			} else if (pile.length > 0) {
				const topCard = pile[pile.length - 1];
				if (suitsAreStackable(topCard.suit, card.suit) && topCard.value - 1 === card.value) {
					targetPile = index;
					break;
				}
			}
			index++;
		}

		return targetPile;
	};

	const suitsAreStackable = (suit1: number, suit2: number): boolean => {
		if (suit1 === 0 || suit1 === 3) {
			if (suit2 === 1 || suit2 === 2) {
				return true;
			}
		}
		if (suit1 === 1 || suit1 === 2) {
			if (suit2 === 0 || suit2 === 3) {
				return true;
			}
		}
		return false;
	};

	const moveFromStockToFoundation = (card: CardType, pileIndex: number): void => {
		if (pileIndex !== -1) {
			const newFoundations = [...foundations];
			newFoundations[pileIndex].push(card);
			setFoundations(newFoundations);
			const newStock = [...stock];
			newStock.splice(stockIndex, 1);
			setStock(newStock);
			if (stockIndex > 0) {
				setStockIndex(stockIndex - 1);
			}
			setNumberOfMoves(numberOfMoves + 1);
		}
	};

	const moveFromStockToWaste = (card: CardType, pileIndex: number): void => {
		if (pileIndex !== -1) {
			const newWaste = [...waste];
			card.visible = true;
			newWaste[pileIndex].push(card);
			setWaste(newWaste);
			const newStock = [...stock];
			newStock.splice(stockIndex, 1);
			setStock(newStock);
			if (stockIndex > 0) {
				setStockIndex(stockIndex - 1);
			}
			setNumberOfMoves(numberOfMoves + 1);
		}
	};

	const moveFromFoundationToWaste = (card: CardType, pileIndex: number): void => {
		if (pileIndex !== -1) {
			const newWaste = [...waste];
			card.visible = true;
			newWaste[pileIndex].push(card);
			setWaste(newWaste);
			const newFoundations = [...foundations];
			newFoundations[pileIndex].pop();
			setFoundations(newFoundations);
			setNumberOfMoves(numberOfMoves + 1);
		}
	};

	const moveFromWasteToFoundation = (card: CardType, wastePileIndex: number, foundationPileIndex: number): void => {
		if (foundationPileIndex !== -1) {
			const newFoundations = [...foundations];
			newFoundations[foundationPileIndex].push(card);
			setFoundations(newFoundations);
			const newWaste = [...waste];
			newWaste[wastePileIndex].pop();
			if (newWaste[wastePileIndex].length > 0) {
				newWaste[wastePileIndex][newWaste[wastePileIndex].length - 1].visible = true;
			}
			setWaste(newWaste);
			setNumberOfMoves(numberOfMoves + 1);
		}
	};

	const moveFromWasteToWaste = (cards: CardType[], originWastePileIndex: number, targetWastePileIndex: number): void => {
		if (originWastePileIndex !== -1 && targetWastePileIndex !== -1) {
			const newWaste = [...waste];
			cards.forEach((card) => {
				newWaste[originWastePileIndex].pop();
				newWaste[targetWastePileIndex].push(card);
				if (newWaste[originWastePileIndex].length > 0) {
					newWaste[originWastePileIndex][newWaste[originWastePileIndex].length - 1].visible = true;
				}
			});
			setWaste(newWaste);
			setNumberOfMoves(numberOfMoves + 1);
		}
	};

	const renderVisibleStock = (): JSX.Element => {
		return (
			<div className={styles.stock__visible}>
				{stockIndex - 2 >= 0 && <Card {...stock[stockIndex - 2]} visible={true} position={CardPosition.STOCK} />}
				{stockIndex - 1 >= 0 && <Card {...stock[stockIndex - 1]} visible={true} position={CardPosition.STOCK} />}
				{stockIndex > -1 && <Card {...stock[stockIndex]} visible={true} position={CardPosition.STOCK} onClick={visibleStockClickHandler} />}
			</div>
		);
	};

	const renderNewGameButton = (): JSX.Element => {
		return (
			<button className={styles.button} onClick={newGameClickHandler}>
				New game
			</button>
		);
	};

	const renderWinnerScreen = (): JSX.Element => {
		return (
			<div className={styles.game__finished}>
				<p>Winner!</p>
				<p>{renderNewGameButton()}</p>
			</div>
		);
	};

	const renderSolitaireBoard = (): JSX.Element => {
		return (
			<>
				<div className={styles.solitaire__header}>
					<h3>Number of moves: {numberOfMoves}</h3>
				</div>
				<div className={styles.solitaire__top}>
					<div className={styles.foundations}>
						{foundations.map((pile, index) => {
							if (pile.length) {
								return (
									<div className={styles.pile} key={index}>
										<div className={styles.slot__empty}>
											<Card key={index} {...pile[pile.length - 1]} visible={true} position={CardPosition.FOUNDATION} onClick={() => foundationClickHandler(index)} />
										</div>
									</div>
								);
							} else {
								return (
									<div className={styles.pile} key={index}>
										<div className={styles.slot__empty}></div>
									</div>
								);
							}
						})}
					</div>
					<div className={styles.stock}>
						{renderVisibleStock()}
						<div className={styles.slot} onClick={hiddenStockClickHandler}></div>
					</div>
				</div>
				<div className={styles.solitaire__bottom}>
					<div className={styles.waste}>
						{waste.map((pile, pileIndex) => (
							<div className={styles.pile} key={pileIndex}>
								{!!pile.length && pile.map((card, cardIndex) => <Card key={cardIndex} {...card} position={CardPosition.WASTE} onClick={() => wasteClickHandler(pileIndex, cardIndex)} />)}
								{!pile.length && <div className={styles.slot__empty} key={pileIndex}></div>}
							</div>
						))}
					</div>
				</div>
				<div className={styles.solitaire__footer}>{renderNewGameButton()}</div>
			</>
		);
	};

	return (
		<div className={styles.solitaire}>
			{!isGameFinished && renderSolitaireBoard()}
			{isGameFinished && renderWinnerScreen()}
		</div>
	);
};

export default Solitaire;
