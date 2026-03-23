from __future__ import annotations

import random
import time
from dataclasses import dataclass
from typing import Dict, List


QUESTIONS: Dict[str, List[str]] = {
    "easy": [
        "seal",
        "jump",
        "ocean",
        "ice",
        "punch",
        "combo",
    ],
    "normal": [
        "the seal swims swiftly",
        "typing builds battle rhythm",
        "focus speed and accuracy",
        "short lines chain combos",
        "misses reduce your power",
    ],
    "hard": [
        "long sentences unleash heavy strikes against powerful enemies",
        "precise typing under pressure creates the highest sustained damage",
        "growth comes from repetition mastery and adaptive combat style",
    ],
}


@dataclass
class Status:
    hp: int
    atk: int
    defense: int
    speed: int


@dataclass
class Character:
    name: str
    style: str
    status: Status
    level: int = 1
    exp: int = 0
    trait: str = "none"
    combo_count: int = 0
    weaken_stacks: int = 0

    def gain_exp(self, amount: int) -> List[str]:
        logs = [f"{self.name} gained {amount} EXP."]
        self.exp += amount
        while self.exp >= self.next_level_exp:
            self.exp -= self.next_level_exp
            self.level += 1
            self.status.hp += 8
            self.status.atk += 2
            self.status.defense += 1
            self.status.speed += 1
            logs.append(f"LEVEL UP! {self.name} is now Lv.{self.level}.")
        return logs

    @property
    def next_level_exp(self) -> int:
        return self.level * 100


class TypingJudge:
    @staticmethod
    def evaluate(target: str, typed: str, elapsed: float) -> Dict[str, float]:
        correct = sum(1 for a, b in zip(target, typed) if a == b)
        accuracy = correct / max(len(target), 1)
        if typed == target:
            accuracy = 1.0

        cps = len(typed) / max(elapsed, 0.1)
        is_correct = typed == target
        is_short = len(target) <= 12
        is_long = len(target) >= 30

        return {
            "accuracy": accuracy,
            "cps": cps,
            "is_correct": float(is_correct),
            "is_short": float(is_short),
            "is_long": float(is_long),
            "length": float(len(target)),
        }


class ComboSystem:
    @staticmethod
    def update_combo(player: Character, result: Dict[str, float]) -> int:
        if result["is_correct"] and result["is_short"]:
            player.combo_count += 1
        elif result["is_correct"]:
            player.combo_count = max(1, player.combo_count)
        else:
            player.combo_count = 0
            player.weaken_stacks = min(player.weaken_stacks + 1, 3)

        return player.combo_count

    @staticmethod
    def combo_bonus(combo: int) -> float:
        return min(1.0 + combo * 0.08, 1.8)


class DamageCalculator:
    STYLE_MULTIPLIER = {
        "short": {"short": 1.25, "long": 0.9, "base": 1.0},
        "long": {"short": 0.9, "long": 1.35, "base": 1.0},
        "balance": {"short": 1.05, "long": 1.05, "base": 1.0},
    }

    @classmethod
    def calc_damage(
        cls,
        player: Character,
        enemy: Character,
        result: Dict[str, float],
    ) -> int:
        if not result["is_correct"]:
            return 0

        base = player.status.atk
        speed_factor = min(result["cps"] / 6.0, 1.8)
        acc_factor = 0.6 + result["accuracy"] * 0.8

        style_table = cls.STYLE_MULTIPLIER[player.style]
        style_factor = style_table["base"]
        if result["is_short"]:
            style_factor *= style_table["short"]
        if result["is_long"]:
            style_factor *= style_table["long"]

        combo_factor = ComboSystem.combo_bonus(player.combo_count)
        weaken_factor = max(1.0 - 0.12 * player.weaken_stacks, 0.6)

        raw = base * speed_factor * acc_factor * style_factor * combo_factor * weaken_factor
        reduced = max(1.0, raw - enemy.status.defense * 0.5)

        if result["is_long"]:
            reduced *= 1.25

        damage = int(round(reduced))
        if player.weaken_stacks > 0:
            player.weaken_stacks -= 1
        return max(damage, 1)


def pick_difficulty_by_level(level: int) -> str:
    if level <= 2:
        return "easy"
    if level <= 4:
        return "normal"
    return "hard"


class BattleSystem:
    def __init__(self, player: Character) -> None:
        self.player = player
        self.enemy = Character(
            name="Training Crab",
            style="balance",
            status=Status(hp=80, atk=8, defense=4, speed=4),
        )

    def run(self) -> None:
        print("=== Typing Growth RPG ===")
        print("Type the shown text exactly. Accuracy + speed decides damage.")
        print("Short text: combo / Long text: heavy strike / Miss: weaken")
        print("-------------------------------------------------------------")

        turn = 1
        while self.player.status.hp > 0 and self.enemy.status.hp > 0:
            print(f"\n[Turn {turn}] {self.player.name} HP:{self.player.status.hp} | {self.enemy.name} HP:{self.enemy.status.hp}")

            difficulty = pick_difficulty_by_level(self.player.level)
            target = random.choice(QUESTIONS[difficulty])
            print(f"Target ({difficulty}): {target}")

            start = time.perf_counter()
            try:
                typed = input("> ").strip()
            except EOFError:
                print("\nInput ended. Battle aborted.")
                return
            elapsed = time.perf_counter() - start

            result = TypingJudge.evaluate(target, typed, elapsed)
            ComboSystem.update_combo(self.player, result)
            dmg = DamageCalculator.calc_damage(self.player, self.enemy, result)
            self.enemy.status.hp -= dmg

            if result["is_correct"]:
                print(
                    f"Hit! dmg={dmg} | acc={result['accuracy']:.0%} | cps={result['cps']:.2f} | combo={self.player.combo_count}"
                )
            else:
                print(
                    f"Miss... acc={result['accuracy']:.0%}. Weaken stack={self.player.weaken_stacks}"
                )

            if self.enemy.status.hp <= 0:
                break

            enemy_damage = max(self.enemy.status.atk - self.player.status.defense // 2, 1)
            self.player.status.hp -= enemy_damage
            print(f"{self.enemy.name} attacks for {enemy_damage} damage.")
            turn += 1

        if self.player.status.hp > 0:
            print("\nVictory!")
            logs = self.player.gain_exp(120)
            for line in logs:
                print(line)
            print(f"Current Lv.{self.player.level} | EXP {self.player.exp}/{self.player.next_level_exp}")
        else:
            print("\nDefeat... Try improving rhythm and precision.")


def choose_style() -> str:
    print("Choose your style: [1] short [2] long [3] balance")
    raw = input("style> ").strip()
    mapping = {"1": "short", "2": "long", "3": "balance"}
    return mapping.get(raw, "balance")


def main() -> None:
    style = choose_style()
    player = Character(
        name="Baby Seal",
        style=style,
        status=Status(hp=100, atk=12, defense=6, speed=8),
        trait="brave",
    )
    BattleSystem(player).run()


if __name__ == "__main__":
    main()
