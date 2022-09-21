import styles from './Card.module.css';

export enum Suit {
	clubs,
	diamonds,
	hearts,
	spades
}

export interface CardType {
	suit: Suit;
	value: number;
	visible: boolean;
}

export enum CardPosition {
	STOCK,
	WASTE,
	FOUNDATION
}

interface CardProps extends CardType {
	indexInWaste?: number;
	position: CardPosition;
	onClick?: () => void;
}

const Card = (props: CardProps): JSX.Element => {
	const getSuitClassname = (suit: Suit): string => {
		switch (suit) {
			case Suit.clubs:
				return styles.card__suit_clubs;
			case Suit.diamonds:
				return styles.card__suit_diamonds;
			case Suit.hearts:
				return styles.card__suit_hearts;
			case Suit.spades:
				return styles.card__suit_spades;
		}
	};

	const getSuitSpecialChar = (suit: Suit): string => {
		switch (suit) {
			case Suit.clubs:
				return '♣';
			case Suit.diamonds:
				return '♦';
			case Suit.hearts:
				return '♥';
			case Suit.spades:
				return '♠';
		}
	};

	const getCardNumber = (value: number): string => {
		switch (value) {
			case 1:
				return 'A';
			case 11:
				return 'J';
			case 12:
				return 'Q';
			case 13:
				return 'K';
			default:
				return value.toString();
		}
	};

	const renderVisibleCard = (card: CardType) => {
		return (
			<div className={getCardClassnames(props.visible, props.position)} onClick={props.onClick}>
				<div className={`${styles.card__value} ${getSuitClassname(props.suit)}`}>{getCardNumber(props.value)}</div>
				<div className={`${styles.card__suit_icon} ${getSuitClassname(props.suit)}`}>{getSuitSpecialChar(props.suit)}</div>
				<div className={`${styles.card__suit} ${getSuitClassname(props.suit)}`}>{getSuitSpecialChar(props.suit)}</div>
			</div>
		);
	};

	const renderHiddenCard = (card: CardType) => {
		return <div className={getCardClassnames(props.visible, props.position)}></div>;
	};

	const getCardClassnames = (visible: boolean, position: CardPosition): string => {
		const classnames = [styles.card];
		if (position === CardPosition.WASTE) {
			classnames.push(styles.card__in_waste);
		}
		if (position === CardPosition.STOCK) {
			classnames.push(styles.card__in_stock);
		}
		if (!visible) {
			classnames.push(styles.card__hidden);
		}

		return classnames.join(' ');
	};

	if (props.visible) {
		return renderVisibleCard(props);
	}

	return renderHiddenCard(props);
};

export default Card;
