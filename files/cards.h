/********************************************************************
* cards.h
* Declaration for the Card and Player class.
*
* Do not modify this file.
**********************************************************************/

#include <string>
#include <cstdlib>
#include <ctime>

#ifndef CARDS_H
#define CARDS_H

using namespace std;

class Player {
public:

	//Construct Player with specified starting money.
	Player(int start_money);

	//Accessor
	int get_money() const;

	//Mutator updates money by specified amount.  Send negative # to decrement.
	//e.g. frodo.change_money(500); adds $500 to Frodo's total amount.
	//     frodo.change_money(-500); removes $500 from Frodo's total amount.
	void change_money(int update);

private:
	int money;  //Amount of money player has.
};


class Card {
public:

	//Default constructor assigns random rank & suit to card.
	Card();

	//Accessors
	string get_rank() const;
	string get_suit() const;

	//Compare rank of two cards, e.g. Eight<Jack is true.
	//Assume Ace is always low (value 1).
	//Should use the rank2num() function.
	bool operator< (Card card2) const;

	//This function converts card rank to number.
	//Returns a number from 1 to 13.
	//Useful for comparing cards.
	//e.g. Three->3, Ace->1, King->13
	int rank2num() const;

private:
	string cardRank;  //Ace, Two - Ten, Jack, Queen, King
	string suit;  //Hearts, Diamonds, Clubs, Spades
	unsigned int rankNum;
};

#endif
